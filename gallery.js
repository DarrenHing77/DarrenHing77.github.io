document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = new Set(); // Store unique connections
    const nodeSize = 180;
    const spacing = 250;
    const numNodes = 14;

    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/your-image5.jpg", "media/your-image6.jpg", "media/your-image7.jpg", "media/your-image8.jpg",
        "media/your-image9.jpg", "media/your-image10.jpg", "media/your-image11.jpg", "media/your-image12.jpg",
        "media/your-image13.jpg", "media/your-image14.jpg"
    ];

    function isOverlapping(newX, newY) {
        return nodes.some(node => {
            const dx = node.x - newX;
            const dy = node.y - newY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < spacing;
        });
    }

    function createNode(image, index) {
        let x, y, tries = 0;
        do {
            const safeMargin = nodeSize * 1.2;
            const minY = nodeSize * 0.5; // Prevents clipping at the top
            x = Math.random() * (gallery.clientWidth - safeMargin);
            y = minY + Math.random() * (gallery.clientHeight - safeMargin - minY);
            tries++;
        } while (isOverlapping(x, y) && tries < 300);

        if (tries >= 300) return;

        const node = document.createElement("div");
        node.classList.add("node");
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.setAttribute("id", `node-${index}`); // Unique ID for dataset reference

        const img = document.createElement("img");
        img.src = image;
        node.appendChild(img);

        gallery.appendChild(node);
        nodes.push({ element: node, x, y });

        // Add hover effect
        node.addEventListener("mouseenter", () => {
            node.style.borderColor = "rgba(0, 140, 255, 1)"; // Blue outline on hover
            highlightConnections(node, true);
        });
        node.addEventListener("mouseleave", () => {
            node.style.borderColor = "white"; // Reset to default outline
            highlightConnections(node, false);
        });
    }

    function createConnection(nodeA, nodeB) {
        if (!nodeA || !nodeB || !nodeA.element || !nodeB.element) {
            console.error("Connection Error: One of the nodes is undefined", nodeA, nodeB);
            return;
        }

        const key = [nodeA.element.id, nodeB.element.id].sort().join('-'); // Unique key
        if (connections.has(key)) return; // Prevent duplicate

        const line = document.createElement("div");
        line.classList.add("line");
        line.style.position = "absolute";
        line.style.background = "white";
        line.style.height = "2px
