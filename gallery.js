document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = [];
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
            x = Math.random() * (gallery.clientWidth - nodeSize);
            y = Math.random() * (gallery.clientHeight - nodeSize);
            tries++;
        } while (isOverlapping(x, y) && tries < 100);
        
        if (tries >= 100) return;
        
        const node = document.createElement("div");
        node.classList.add("node");
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;

        const img = document.createElement("img");
        img.src = image;
        node.appendChild(img);

        gallery.appendChild(node);
        nodes.push({ element: node, x, y });
    }

    function createConnection(nodeA, nodeB) {
        const line = document.createElement("div");
        line.classList.add("line");
        gallery.insertBefore(line, gallery.firstChild);
        connections.push({ element: line, nodeA, nodeB });
    }

    images.forEach(img => createNode(img));

    // Ensure all nodes connect in order and prevent far connections
    nodes.sort((a, b) => a.x - b.x);
    for (let i = 0; i < nodes.length - 1; i++) {
        createConnection(nodes[i], nodes[i + 1]);
    }

    function updateConnections() {
        connections.forEach(({ element, nodeA, nodeB }) => {
            const x1 = nodeA.element.offsetLeft + nodeSize / 2;
            const y1 = nodeA.element.offsetTop + nodeSize / 2;
            const x2 = nodeB.element.offsetLeft + nodeSize / 2;
            const y2 = nodeB.element.offsetTop + nodeSize / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            element.style.width = `${length}px`;
            element.style.left = `${x1}px`;
            element.style.top = `${y1}px`;
            element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        });
    }

    updateConnections();
});
