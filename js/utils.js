// Utility function to resize canvas
function resizeCanvas() {
    const canvas = document.getElementById('canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        console.error('Canvas element not found');
    }
}