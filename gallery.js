document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const connections = new Set(); // Store unique connections
    const nodeSize = 180;
    const spacing = 250;
    const numNodes = 14;
    const seed = 12345; // Change this number to shuffle the arrangement

    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/your-image5.jpg", "media/your-image6.jpg", "media/your-image7.jpg", "media/your-image8.jpg",
        "media/your-image9.jpg", "media/your-image10.jpg", "media/your-image11.jpg", "media/your-image12.jpg",
        "media/your-image13.jpg", "media/your-image14.jpg"
    ];

    function seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    function createNode(image, index) {
        const safeMargin = nodeSize * 1.2;
        const minY = nodeSize * 0.5; // Prevents clipping at the top

        let x = seededRandom(index + seed) * (gallery.clientWidth - safeMargin);
        let y = minY + seededRandom(index + seed * 2) * (gallery.clientHeight - safeMargin - minY);

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
        line.style.background = "red"; // DEBUG: Set to red for visibility
        line.style.height = "5px"; // DEBUG: Make thicker
        line.style.zIndex = "9999"; // DEBUG: Ensure it is above elements

        gallery.insertBefore(line, gallery.firstChild);
        connections.add(key);

        line.dataset.nodeA = nodeA.element.id || "";
        line.dataset.nodeB = nodeB.element.id || "";
        console.log(`Creating connection: ${nodeA.element.id} ↔ ${nodeB.element.id}`);
    }

    images.slice(0, numNodes).forEach((img, index) => createNode(img, index));

    setTimeout(() => {
        if (nodes.length < 2) {
            console.warn("Not enough nodes to create connections.");
            return;
        }

        nodes.forEach(node => {
            let closest = getClosestNeighbors(node, 2, 250);
            if (closest.length === 0 && nodes.length > 1) {
                closest = getClosestNeighbors(node, 1, 500); // Emergency fallback
            }
            closest.forEach(neighbor => createConnection(node, neighbor));
        });

        console.log("Connections successfully created:", connections.size);
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
            if (!line.dataset.nodeA || !line.dataset.nodeB) {
                console.warn("Skipping invalid connection", line);
                return;
            }

            const nodeA = document.getElementById(line.dataset.nodeA);
            const nodeB = document.getElementById(line.dataset.nodeB);

            if (!nodeA || !nodeB) {
                console.warn("Skipping connection due to missing nodes", line.dataset.nodeA, line.dataset.nodeB);
                return;
            }

            const x1 = nodeA.offsetLeft + nodeSize / 2;
            const y1 = nodeA.offsetTop + nodeSize / 2;
            const x2 = nodeB.offsetLeft + nodeSize / 2;
            const y2 = nodeB.offsetTop + nodeSize / 2;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            console.log(`Line from (${x1}, ${y1}) to (${x2}, ${y2}) - Width: ${length}px`);

            line.style.width = `${length}px`;
            line.style.left = `${x1}px`;
            line.style.top = `${y1}px`;
            line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
            line.style.border = "1px solid yellow"; // DEBUG: Outline for visibility
        });
    }

    function highlightConnections(node, isHovering) {
        connections.forEach((line) => {
            if (!line.dataset.nodeA || !line.dataset.nodeB) {
                console.warn("Skipping invalid connection", line);
                return;
            }

            const nodeA = document.getElementById(line.dataset.nodeA);
            const nodeB = document.getElementById(line.dataset.nodeB);

            if (!nodeA || !nodeB) {
                console.warn("Skipping connection due to missing nodes", line.dataset.nodeA, line.dataset.nodeB);
                return;
            }

            if (line.dataset.nodeA === node.id || line.dataset.nodeB === node.id) {
                line.style.background = isHovering
                    ? "linear-gradient(to right, rgba(0,140,255,1), white)"
                    : "linear-gradient(to right, white, transparent)";
            }
        });
    }
});
