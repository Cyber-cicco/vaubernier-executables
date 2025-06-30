window.addEventListener('download-file', async (e) => {
    try {
        console.log("triggering event")
        // Fetch the file from the URL
        const response = await fetch("/commandes/download");

        // Get the blob from the response
        const blob = await response.blob();

        // Create a URL for the blob
        const blobUrl = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const a = document.createElement('a');

        // Set properties for the anchor
        a.href = blobUrl;
        a.download = "commande.csv"

        // Append to body, click to trigger download, then remove
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);

        console.log('Download initiated successfully');
    } catch (error) {
        console.error('Error downloading the file:', error);
    }
})
