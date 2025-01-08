const printQRCode = (imageUrl: string) => {
  try {
    // Create print window
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      throw new Error("Popup blocked");
    }

    // Write HTML content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            @media print {
              @page {
                margin: 0;
                size: auto;
              }
              body {
                margin: 0;
                padding: 0;
              }
              img {
                width: 100%;
                height: auto;
                page-break-inside: avoid;
              }
            }
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <img 
            src="${imageUrl}" 
            alt="Print preview"
            onload="setTimeout(() => { window.print(); window.close(); }, 200);"
            onerror="window.close(); alert('Failed to load image');"
          />
        </body>
      </html>
    `);

    printWindow.document.close();
  } catch (error) {
    console.error("Print error:", error);
    alert("Failed to print image. Please allow popups for this feature.");
  }
};

export default printQRCode;
