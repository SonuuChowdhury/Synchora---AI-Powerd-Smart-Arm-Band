
// Import required modules
// express: Web framework for Node.js to handle HTTP requests and routing
// multer: Middleware for handling multipart/form-data (file uploads)
// spawn: Used to start child processes (here, to run Python scripts)
// GoogleGenerativeAI: Used for generation of descriptive text
import express from "express";
import multer from "multer";
import { spawn } from "child_process";
import { GoogleGenerativeAI } from "@google/generative-ai";



// Create an Express application instance
const app = express();

// Configure multer for handling file uploads in memory
const upload = multer();

// Variable for Gemini API key (replace with your actual key)
const GEMINI_API_KEY = "AIzaSyDfoEbYTtOlcA46NPfWeNZvIxJQ-dLjC7E";

// Define a POST endpoint '/upload' to receive image uploads
// The 'upload.single("image")' middleware extracts a single file from the 'image' field
// Define a POST endpoint '/upload' to receive image uploads
// The 'upload.single("image")' middleware extracts a single file from the 'image' field
app.post("/upload", upload.single("image"), async (req, res) => {
  // Log that an upload request was received
  console.log('Received upload request');
  

  // Check if a file was uploaded
  if (!req.file) {
    console.log('No file in request');
    // Respond with error if no file is present
    return res.status(400).json({ error: "No image file provided" });
  }


  // Log details about the uploaded file
  console.log('File info:', {
    fieldname: req.file.fieldname,      // Form field name
    originalname: req.file.originalname,// Original filename
    mimetype: req.file.mimetype,        // MIME type (e.g., image/png)
    size: req.file.buffer.length        // Size in bytes
  });


  // Validate that the uploaded file is an image
  // This checks the MIME type starts with 'image/'
  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: "File must be an image" });
  }


  // Determine the correct Python command for the OS
  // 'python' for Windows, 'python3' for Unix-like systems
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  
  // Start the Python process to run the detection script
  // The image buffer will be sent to the Python script via stdin
  console.log(`Starting Python process: ${pythonCmd} detect.py`);
  const python = spawn(pythonCmd, ["detect.py"], {
    stdio: ['pipe', 'pipe', 'pipe'] // stdin, stdout, stderr
  });


  // Variables to collect output and error data from Python
  let data = "";
  let errorData = "";
  let responseHandled = false; // Prevents multiple responses


  // Set a timeout to kill the Python process if it takes too long (30 seconds)
  const timeout = setTimeout(() => {
    if (!responseHandled) {
      console.log('Python process timed out');
      python.kill('SIGTERM'); // Terminate the process
      responseHandled = true;
      res.status(500).json({ error: "Detection process timed out" });
    }
  }, 30000); // 30 second timeout


  // Handle errors when starting the Python process
  python.on('error', (error) => {
    console.error('Failed to start Python process:', error);
    if (!responseHandled) {
      responseHandled = true;
      clearTimeout(timeout);
      res.status(500).json({ 
        error: "Failed to start detection process",
        details: error.message
      });
    }
  });


  // Collect data from Python's stdout (detection results)
  python.stdout.on("data", (chunk) => {
    data += chunk.toString();
    console.log('Received stdout chunk:', chunk.toString());
  });


  // Collect error messages from Python's stderr
  python.stderr.on("data", (chunk) => {
    errorData += chunk.toString();
    console.error('Python stderr:', chunk.toString());
  });


  // Handle the Python process closing (either normally or with error)
  python.on("close", async (code, signal) => {
    clearTimeout(timeout);
    
    if (responseHandled) {
      console.log('Response already handled, ignoring close event');
      return;
    }
    
    responseHandled = true;
    
    console.log(`Python process closed with code ${code}, signal ${signal}`);
    console.log('Python stdout:', data);
    
    if (errorData) {
      console.log('Python stderr:', errorData);
    }

    // If the process was killed by timeout
    if (signal === 'SIGTERM') {
      return res.status(500).json({ error: "Detection process was terminated" });
    }

    // If the process exited with error code
    if (code !== 0) {
      console.error(`Python process exited with code ${code}`);
      return res.status(500).json({ 
        error: "Detection process failed", 
        code, 
        stderr: errorData,
        stdout: data 
      });
    }

    // If no output was received from Python
    if (!data.trim()) {
      return res.status(500).json({ 
        error: "No output from detection process",
        stderr: errorData 
      });
    }

    // Try to parse the output from Python as JSON
    try {
      const result = JSON.parse(data.trim());
      
      // If Python returned an error
      if (result.error) {
        return res.status(500).json(result);
      }

      // --- Gemini Integration ---
      // Prepare prompt for Gemini model
      /*
        The prompt instructs Gemini to:
        - Analyze the detection output (JSON)
        - Generate a short, natural, spoken description of the scene
        - Follow specific rules for place, positions, safety, and style
        - Respond ONLY with the speech output, no extra text or formatting
      */
      const geminiPrompt = `You are given AI detection output in JSON format.\nYour task is to convert this detection data into a short 30-second spoken description of the scene. Follow these rules carefully:\n\n1. Identify the place (home, street, classroom, park, office, etc.) by looking at the types of detected objects.\n2. Describe the scene naturally, not like a list, but like you are explaining what is happening.\n3. Classify positions (say \"on the left,\" \"in the middle,\" \"towards the right\") based on bbox x values (smaller x = left, larger x = right).\n4. Add safety or social measures depending on the objects.\n   - If many motorbikes or cars → \"Be careful of traffic.\"\n   - If many people and looks like class/office → \"Maintain silence and focus.\"\n   - If it looks like home/few people → \"It seems peaceful here.\"\n5. Keep it conversational, easy to speak, with commas and full stops for speech flow.\n6. Avoid heavy or complex words. Use simple daily language.\n7. Final output should be one short descriptive speech, not a report.\n\nIMPORTANT: Your response should ONLY be the speech output, nothing else, so it can be extracted easily.\n\nDetection output:\n${JSON.stringify(result)}`;

      // Initialize Gemini model
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Send prompt to Gemini and get the generated speech description
      let geminiResponse = "";
      try {
        const geminiResult = await model.generateContent(geminiPrompt);
        geminiResponse = geminiResult.response.text();
      } catch (err) {
        console.error("Gemini API error:", err);
        return res.status(500).json({ error: "Failed to generate description", details: err.message });
      }

      // Return both detection result and Gemini speech description
      res.json({
        detection: result,
        speech: geminiResponse
      });
    } catch (e) {
      // If output is not valid JSON
      console.error('Failed to parse Python output:', data);
      res.status(500).json({ 
        error: "Invalid detection result", 
        output: data.trim(),
        parseError: e.message 
      });
    }
  });


  // Wait briefly to ensure the Python process is ready before sending data
  setTimeout(() => {
    try {
      // Check if Python's stdin is available and writable
      if (python.stdin && python.stdin.writable && !responseHandled) {
        console.log('Writing image buffer to Python process...');
        
        // Write the image buffer to Python's stdin
        python.stdin.write(req.file.buffer, (error) => {
          if (error) {
            console.error('Error writing buffer:', error);
            if (!responseHandled) {
              responseHandled = true;
              clearTimeout(timeout);
              res.status(500).json({ error: "Error sending image data to Python process" });
            }
          } else {
            console.log('Buffer written successfully');
            
            // End stdin after writing to signal end of input
            python.stdin.end((error) => {
              if (error) {
                console.error('Error ending stdin:', error);
              } else {
                console.log('Stdin ended successfully');
              }
            });
          }
        });
      } else {
        // If Python's stdin is not available, handle error
        console.error('Python stdin not available or process ended');
        if (!responseHandled) {
          responseHandled = true;
          clearTimeout(timeout);
          res.status(500).json({ error: "Python process not ready" });
        }
      }
    } catch (error) {
      // Catch any exceptions during writing
      console.error('Exception writing to Python stdin:', error);
      if (!responseHandled) {
        responseHandled = true;
        clearTimeout(timeout);
        res.status(500).json({ error: "Error sending image data" });
      }
    }
  }, 100); // Wait 100ms for process to start
});


// Start the Express server on port 3000
// The server will listen for incoming HTTP requests
app.listen(3000, () => console.log("🚀 Server running on port 3000"));


/*
Process Flow:
-------------
1. Client sends a POST request to '/upload' with an image file.
2. Multer middleware extracts the image and makes it available as req.file.
3. Server validates the file and starts a Python process for object detection.
4. Image buffer is sent to Python via stdin; Python returns detection results as JSON.
5. Server parses the detection output and sends it as a prompt to Gemini (gemini-1.5-flash).
6. Gemini generates a short, spoken description of the scene, following strict rules for format and style.
7. Server responds with both the detection output and the generated speech description.

This enables real-time scene understanding and natural language description using AI detection and generative models.
*/




// Process Flow
// Client Uploads Image:
// A client (like Postman or a web app) sends an HTTP POST request to /upload with an image file.

// Node.js Receives Image:
// The Node.js server uses Multer to extract the image from the request and keeps it in memory as a buffer.

// Node.js Starts Python Process:
// The server uses Node’s child_process.spawn() to start the Python script (detect.py).
// It sets up communication channels:

// stdin (input to Python)
// stdout (output from Python)
// stderr (error messages from Python)
// Node.js Sends Image to Python:
// The server writes the image buffer to the Python process’s stdin.
// In Python, sys.stdin.buffer.read() reads this image data.

// Python Processes Image:
// The Python script decodes the image, runs object detection, and prints the results as JSON to stdout.

// Node.js Reads Python Output:
// The server listens for data on Python’s stdout.
// When Python finishes, Node.js reads the JSON result.

// Node.js Responds to Client:
// The server sends the detection result (and Gemini speech output) back to the client as a JSON response.