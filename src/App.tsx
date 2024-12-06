import { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";

import "./App.css";

function App() {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [imageFile, setImageFile] = useState<object>({});
  const [soundFile, setSoundFile] = useState<object>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ffmpeg = new FFmpeg();

  const fetchFile = async (file: any): Promise<Uint8Array> => {
    return new Uint8Array(await file.arrayBuffer());
  };

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
    }
  };

  const handleChangeSound = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSoundFile(file);
    }
  };

  const createVideo = async (): Promise<void> => {
    if (!imageFile || !soundFile) {
      alert("Please upload both an image and a sound file!");
      return;
    }

    setIsLoading(true);

    try {
      await ffmpeg.load();

      // Write files to FFmpeg's virtual filesystem
      await ffmpeg.writeFile("image.png", await fetchFile(imageFile));
      await ffmpeg.writeFile("sound.mp3", await fetchFile(soundFile));

      // Run FFmpeg command to generate a video
      await ffmpeg.exec([
        "-framerate", //Specifies Framerate
        "1/10",
        "-i", //Specifies image file image.png
        "image.png",
        "-i",
        "sound.mp3", //Specifies sound file sound.mp3
        "-c:v",
        "libx264", //Sets the video codec to libx264
        "-t", //Sets duration of the video
        "10",
        "-pix_fmt", // Sets the pixel format to yuv420p
        "yuv420p",
        "-vf", // Applies video filter to scale the image to a resolution of 1920x1080
        "scale=1920:1080",
        "output.mp4", //Output file name
      ]);

      const data = await ffmpeg.readFile("output.mp4");

      const videoBlob = new Blob([data], { type: "video/mp4" });
      setVideoSrc(URL.createObjectURL(videoBlob));
    } catch (error) {
      console.error("Error creating video:", error);
      alert("An error occurred while creating the video.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Create a Video from an Image and Sound</h1>

      <div>
        <label>Image File:</label>
        <input type="file" accept="image/*" onChange={handleChangeImage} />
      </div>

      <div>
        <label>Sound File:</label>
        <input type="file" accept="audio/*" onChange={handleChangeSound} />
      </div>

      <div>
        <button onClick={createVideo} disabled={isLoading}>
          {isLoading ? "Processing..." : "Create Video"}
        </button>
      </div>

      {videoSrc && (
        <div>
          <h2>Output Video:</h2>
          <video src={videoSrc} controls width="600"></video>
        </div>
      )}
    </div>
  );
}

export default App;
