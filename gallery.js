document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = [];
    const nodeSize = 180;
    const spacing = 220;
    const numNodes = 12;

    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/your-image5.jpg", "media/your-image6.jpg", "media/your-image7.jpg", "media/your-image8.jpg",
        "media/your-image9.jpg", "media/your-image10.jpg", "media/your-image11.jpg", "media/your-image12.jpg"
    ];

    function isOverlapping(x, y) {
        return nodes.some(n => Math.hypot(n.x - x, n.y - y) < spacing);
    }

    function createNode(image, index) {
        const savedPositions = JSON.parse(localStorage.getItem('fixedNodePositions') || '{}');
        let x, y, tries = 0;

        if (savedPositions[`node-${index}`]) {
            ({ x, y } = savedPositions[`node-${index}`]);
        } else {
            do {
                x = Math.random() * (gallery.clientWidth - nodeSize);
                y = Math.random() * (gallery.clientHeight - nodeSize);
                tries++;
            } while (isOverlapping(x, y) && tries < 500);

            savedPositions[`node-${index}`] = { x, y };
            localStorage.setItem('fixedNodePositions', JSON.stringify(savedPositions));
        }

        const node = document.createElement("div");
        node.className = "node";
        node.id = `node-${index}`;
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;

        const img = document.createElement("img");
        img.src = image;
        node.appendChild(img);
        gallery.appendChild(node);

        node.addEventListener("mouseenter", () => highlight(node, true));
        node.addEventListener("mouseleave", () => highlight(node, false));

        nodes.push({ element: node, x, y });
    }

    function connectNodes() {
        nodes.forEach((node) => {
            let neighbors = getNeighbors(node, 2, 300);
            neighbors.forEach(neighbor => createConnection(node, neighbor));
        });
        updateConnections();
    }

    function getNeighbors(node, count, maxDist) {
        return nodes.filter(n => n !== node)
            .map(n => ({ node: n, dist: Math.hypot(n.x - node.x, n.y - node.y) }))
            .filter(n => n.dist < maxDist)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, count)
            .map(n => n.node);
    }

    function createConnection(nodeA, nodeB) {
        const existing = connections.some(c =>
            (c.nodeA === nodeA && c.nodeB === nodeB) || 
            (c.nodeA === nodeB && c.nodeB === nodeA)
        );
        if (existing) return;

        const line = document.createElement("div");
        line.className = "line";
        gallery.insertBefore(line, gallery.firstChild);

        connections.push({ element: line, nodeA, nodeB });
    }

    function updateConnections() {
        connections.forEach(({ element, nodeA, nodeB }) => {
            const x1 = nodeA.x + nodeSize / 2;
            const y1 = nodeA.y + nodeSize / 2;
            const x2 = nodeB.x + nodeSize / 2;
            const y2 = nodeB.y + nodeSize / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.hypot(dx, dy);

            element.style.width = `${length}px`;
            element.style.left = `${x1}px`;
            element.style.top = `${y1}px`;
            element.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
            element.style.background = "rgba(255,255,255,0.5)";
            element.style.height = "2px";
            element.style.position = "absolute";
            element.style.zIndex = "0";
        });
    }

    function highlight(node, hover) {
        node.style.borderColor = hover ? "rgba(0,140,255,1)" : "white";
        connections.forEach(({ element, nodeA, nodeB }) => {
            if (nodeA.element === node || nodeB.element === node) {
                element.style.background = hover
                    ? "linear-gradient(to right, rgba(0,140,255,1), white)"
                    : "rgba(255,255,255,0.5)";
            }
        });
    }

    // Clear old positions if you want new layout (uncomment if needed)
    // localStorage.removeItem('fixedNodePositions');

    for (let i = 0; i < numNodes; i++) {
        createNode(images[i % images.length], i);
    }

    connectNodes();
});
