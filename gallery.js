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

    function createNode(image, index) {
        const safeMargin = nodeSize * 1.2;
        const minY = nodeSize * 0.5;

        // Load positions from localStorage or generate new ones
        let savedPositions = JSON.parse(localStorage.getItem("nodePositions")) || {};
        let x, y;

        if (savedPositions[`node-${index}`]) {
            ({ x, y } = savedPositions[`node-${index}`]); // Use saved positions
        } else {
            let tries = 0;
            do {
                x = Math.random() * (gallery.clientWidth - safeMargin);
                y = minY + Math.random() * (gallery.clientHeight - safeMargin - minY);
                tries++;
            } while (isOverlapping(x, y) && tries < 300);

            savedPositions[`node-${index}`] = { x, y };
            localStorage.setItem("nodePositions", JSON.stringify(savedPositions));
        }

        const node = document.createElement("div");
        node.classList.add("node");
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.setAttribute("id", `node-${index}`);

        const img = document.createElement("img");
        img.src = image;
        node.appendChild(img);

        gallery.appendChild(node);
        nodes.push({ element: node, x, y });

        node.addEventListener("mouseenter", () => {
            node.style.borderColor = "rgba(0, 140, 255, 1)";
            highlightConnections(node, true);
        });
        node.addEventListener("mouseleave", () => {
            node.style.borderColor = "white";
            highlightConnections(node, false);
        });
    }

    function createConnection(nodeA, nodeB) {
        if (!nodeA || !nodeB || !nodeA.element || !nodeB.element) {
            console.error("Connection Error: Undefined nodes", nodeA, nodeB);
            return;
        }

        const key = [nodeA.element.id, nodeB.element.id].sort().join('-');
        if (connections.has(key)) return;

        const line = document.createElement("div");
        line.classList.add("line");
        line.style.position = "absolute";
        line.style.background = "rgba(255,255,255,0.5)";
        line.style.height = "2px";
        line.style.zIndex = "0";

        gallery.insertBefore(line, gallery.firstChild);
        connections.add(line);

        line.dataset.nodeA = nodeA.element.id;
        line.dataset.nodeB = nodeB.element.id;
    }

    // Create all 14 nodes
    for (let i = 0; i < numNodes; i++) {
        createNode(images[i % images.length], i);
    }

    setTimeout(() => {
        if (nodes.length < 2) {
            console.warn("Not enough nodes to create connections.");
            return;
        }

        nodes.forEach(node => {
            let closest = getClosestNeighbors(node, 2, 250);
            if (closest.length === 0 && nodes.length > 1) {
                closest = getClosestNeighbors(node, 1, 500);
            }
            closest.forEach(neighbor => createConnection(node, neighbor));
        });

        updateConnections();
    }, 100);

    function getClosestNeighbors(node, count = 2, maxDistance = 250) {
        return nodes
            .map(otherNode => ({
                node: otherNode,
                distance: Math.hypot(otherNode.x - node.x, otherNode.y - node.y)
            }))
            .filter(entry => entry.node !== node && entry.distance < maxDistance)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, count)
            .map(entry => entry.node);
    }

    function updateConnections() {
        connections.forEach((line) => {
            const nodeA = document.getElementById(line.dataset.nodeA);
            const nodeB = document.getElementById(line.dataset.nodeB);

            if (!nodeA || !nodeB) {
                console.warn("Missing node for connection", line.dataset.nodeA, line.dataset.nodeB);
                return;
            }

            const x1 = nodeA.offsetLeft + nodeSize / 2;
            const y1 = nodeA.offsetTop + nodeSize / 2;
            const x2 = nodeB.offsetLeft + nodeSize / 2;
            const y2 = nodeB.offsetTop + nodeSize / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length > 0) {
                line.style.width = `${length}px`;
                line.style.left = `${x1}px`;
                line.style.top = `${y1}px`;
                line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
                line.style.display = "block";
            } else {
                line.style.display = "none";
            }
        });
    }

    function highlightConnections(node, isHovering) {
        connections.forEach((line) => {
            if (line.dataset.nodeA === node.id || line.dataset.nodeB === node.id) {
                line.style.background = isHovering
                    ? "linear-gradient(to right, rgba(0,140,255,1), white)"
                    : "rgba(255,255,255,0.5)";
            }
        });
    }
});
