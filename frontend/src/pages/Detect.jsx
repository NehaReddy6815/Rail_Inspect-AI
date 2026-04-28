import React, { useState } from "react";

export default function Detect() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setImageBase64(null);
  };

  const handleDetect = async () => {
    if (!file) return alert("Upload image first");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/detect", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("API response:", data); // 🔍 debug

      // ✅ SAFETY CHECK
      if (!data || !data.detections) {
        alert("Invalid response from backend");
        setLoading(false);
        return;
      }

      setResult(data);
      setImageBase64(data.image_base64);
    } catch (err) {
      console.error(err);
      alert("Backend error");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-5xl space-y-6">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-gray-800">
          🚆 Crack Detection System
        </h1>

        {/* UPLOAD CARD */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <input type="file" onChange={handleFileChange} />

          {preview && (
            <div className="mt-4">
              <p className="text-gray-600 mb-2">Preview</p>
              <img
                src={preview}
                alt="preview"
                className="w-full max-w-lg rounded-lg border"
              />
            </div>
          )}

          <button
            onClick={handleDetect}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Detecting..." : "Run Detection"}
          </button>
        </div>

        {/* RESULT IMAGE */}
        {imageBase64 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-3">
              Detection Result
            </h2>

            <img
              src={`data:image/jpeg;base64,${imageBase64}`}
              alt="result"
              className="w-full max-w-lg rounded-lg border"
            />
          </div>
        )}

        {/* RESULTS */}
        {result && result.detections && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-3">
              Analysis
            </h2>

            <p className="text-lg">
              Total Defects:{" "}
              <span className="text-red-600 font-bold text-xl">
                {result.total_defects}
              </span>
            </p>

            <div className="mt-4 space-y-3">
              {result.detections.map((d, i) => {
                const conf = (d.confidence * 100).toFixed(1);

                return (
                  <div
                    key={i}
                    className="flex justify-between items-center border p-3 rounded-lg"
                  >
                    <span className="font-medium">{d.label}</span>

                    <span
                      className={`font-bold ${
                        conf > 80
                          ? "text-red-600"
                          : conf > 50
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {conf}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}