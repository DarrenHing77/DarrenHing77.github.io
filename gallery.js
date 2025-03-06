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

    function createNode(image) {
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

        const img = document.createElement("img");
        img.src = image;
        node.appendChild(img);

        gallery.appendChild(node);
        nodes.push({ element: node, x, y });

        // Add hover effect
        node.addEventListener("mouseenter", () => {
            node.style.background = "rgba(0, 140, 255, 0.6)"; // Blue highlight
            highlightConnections(node, true);
        });
        node.addEventListener("mouseleave", () => {
            node.style.background = "rgba(255, 255, 255, 0.2)"; // Reset
            highlightConnections(node, false);
        });
    }

    function createConnection(nodeA, nodeB) {
        const key = [nodeA.element, nodeB.element].sort().join('-'); // Unique key
        if (connections.has(key)) return; // Prevent duplicate

        const line = document.createElement("div");
        line.classList.add("line");
        gallery.insertBefore(line, gallery.firstChild);
        connections.add(key);

        line.dataset.nodeA = nodeA.element;
        line.dataset.nodeB = nodeB.element;
    }

    images.slice(0, numNodes).forEach(img => createNode(img));

    function getClosestNeighbors(node, count = 2, maxDistance = 250) {
        return nodes
            .map(otherNode => ({
                node: otherNode,
                distance: Math.hypot(otherNode.x - node.x, otherNode.y - node.y)
            }))
            .filter(entry => entry.node !== node && entry.distance < maxDistance) // Ignore self & too far nodes
            .sort((a, b) => a.distance - b.distance)
            .slice(0, count)
            .map(entry => entry.node);
    }

    nodes.forEach(node => {
        let closest = getClosestNeighbors(node, 2, 250);
        if (closest.length === 0 && nodes.length > 1) {
            closest = getClosestNeighbors(node, 1, 500); // Emergency fallback
        }
        closest.forEach(neighbor => createConnection(node, neighbor));
    });

    function highlightConnections(node, isHovering) {
        connections.forEach((line) => {
            if (line.dataset.nodeA === node || line.dataset.nodeB === node) {
                line.style.background = isHovering
                    ? "linear-gradient(to right, rgba(0,140,255,1), white)"
                    : "linear-gradient(to right, white, transparent)";
            }
        });
    }
});
