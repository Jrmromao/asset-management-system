const printQRCode = (elementId: string) => {
  try {
    const qrCodeElement = document.getElementById(elementId);
    if (!qrCodeElement) {
      throw new Error("QR code element not found");
    }

    // Convert SVG to string
    const svg = qrCodeElement.querySelector("svg");
    if (!svg) {
      throw new Error("SVG element not found within the QR code container");
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    // Create an image
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-t" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Create print window
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        throw new Error("Popup blocked. Please allow popups for this site.");
      }

      // Write HTML content
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              @media print {
                @page { margin: 0; size: auto; }
                body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; }
                img { width: 100%; height: auto; page-break-inside: avoid; }
              }
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
              }
              img {
                max-width: 90%;
                max-height: 90vh;
              }
            </style>
          </head>
          <body>
            <img src="${img.src}" alt="QR Code" />
          </body>
        </html>
      `);

      printWindow.document.close();

      // Print and close
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        URL.revokeObjectURL(url);
      }, 250); // A small delay to ensure the image is rendered
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      throw new Error("Failed to load the QR code image for printing.");
    };

    img.src = url;
  } catch (error) {
    console.error("Print error:", error);
    alert(
      `Failed to print QR code. Please try again. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
};

export default printQRCode;
