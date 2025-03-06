document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = new Set();
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
            const safeMargin = nodeSize * 1.2;  // Prevents placement too close to edges
            x = Math.random() * (gallery.clientWidth - safeMargin);
            const minY = nodeSize * 0.5; // Ensures spacing from the top
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
    }

    function createConnection(nodeA, nodeB) {
    const key = [nodeA.element, nodeB.element].sort().join('-');  // Unique key
    if (connections.has(key)) return;  // Prevent duplicate

    const line = document.createElement("div");
    line.classList.add("line");
    gallery.insertBefore(line, gallery.firstChild);
    connections.add(key);

    // Store connection elements
    line.dataset.nodeA = nodeA.element;
    line.dataset.nodeB = nodeB.element;
}

    }

    images.slice(0, numNodes).forEach(img => createNode(img));

function getClosestNeighbors(node, count = 2, maxDistance = 250) {
    return nodes
        .map(otherNode => ({
            node: otherNode,
            distance: Math.hypot(otherNode.x - node.x, otherNode.y - node.y)
        }))
        .filter(entry => entry.node !== node && entry.distance < maxDistance)  // Ignore self & too far nodes
        .sort((a, b) => a.distance - b.distance)  // Sort by closest
        .slice(0, count)  // Pick the closest ones
        .map(entry => entry.node);
}

// Ensure all nodes connect to their closest two neighbors within range
nodes.forEach(node => {
    let closest = getClosestNeighbors(node, 2, 250);  // Max 250px distance
    if (closest.length === 0 && nodes.length > 1) {
        closest = getClosestNeighbors(node, 1, 500);  // Emergency fallback to prevent isolation
    }
    closest.forEach(neighbor => createConnection(node, neighbor));
});


    // Ensure all nodes connect to their closest two neighbors
    nodes.forEach(node => {
        let closest = getClosestNeighbors(node, 2);  // Connect each node to 2 closest
        closest.forEach(neighbor => createConnection(node, neighbor));
    });

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
