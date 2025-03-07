<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Darren Hing Design</title>
    <style>
        body {
            background-color: black;
            color: #0078A0; /* Original text color from Wix site */
            margin: 0;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        .header {
            display: flex;
            justify-content: space-between;
            padding: 20px;
            background: black;
            position: fixed;
            width: 100%;
            box-sizing: border-box;
            z-index: 100;
        }
        .menu a {
            color: #0078A0;
            text-decoration: none;
            font-size: 18px;
            margin-right: 20px;
        }
        .container {
            display: flex;
            padding-top: 80px; /* Height of header */
            height: calc(100vh - 80px);
            box-sizing: border-box;
        }
        .bio {
            width: 30%;
            padding: 20px;
            color: #0078A0;
        }
        .gallery-container {
            flex-grow: 1;
            position: relative;
            overflow: hidden;
        }
        .node {
            position: absolute;
            width: 180px;
            height: 180px;
            border-radius: 50%;
            border: 2px solid white;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.3s ease, border-color 0.3s ease;
            background-color: rgba(255,255,255,0.1);
            z-index: 2;
        }
        .node img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .line {
            position: absolute;
            background-color: rgba(255,255,255,0.5);
            height: 2px;
            transform-origin: 0 0;
            z-index: 0;
        }
    </style>
</head>

<body>
<div class="header">
    <h1>Darren Hing Design</h1>
    <nav>
        <a href="#">Home</a>
        <a href="#">Portfolio ▼</a>
        <a href="#">Blog</a>
        <a href="#">Contact</a>
    </nav>
</div>

<div class="container">
    <div class="bio">
        <h2 style="color:#F8A332;">Lookdev Artist<br>Lighting Artist<br>Illustrator</h2>
        <p style="color:#0078A0;">
            Hey there! I'm Darren Hing—artist, toolmaker, and professional button masher. By day, I wrangle nodes and shaders...
            Check out my reels <a href="#" style="color:orange;">here</a>.
        </p>
    </div>

    <div id="gallery" style="width:70%; position:relative;"></div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {
    const gallery = document.getElementById("gallery");
    const nodes = [];
    const nodeSize = 180;
    const spacing = 220;
    const numNodes = 12;

    const images = [
        "media/orcKing01.jpg", "media/P_Rick01.jpg", "media/The-Smeds-and-the-Smoos.jpeg", "media/zog01.jpg",
        "media/your-image5.jpg", "media/your-image6.jpg", "media/your-image7.jpg", "media/your-image8.jpg",
        "media/your-image9.jpg", "media/your-image10.jpg", "media/your-image11.jpg", "media/your-image12.jpg"
    ];

    const savedPositions = JSON.parse(localStorage.getItem('fixedNodePositions') || '{}');

    function isOverlapping(x, y) {
        return nodes.some(node => Math.hypot(node.x - x, node.y - y) < spacing);
    }

    for (let i = 0; i < numNodes; i++) {
        let x, y, tries = 0;
        if (savedPositions[`node-${i}`]) {
            ({ x, y } = savedPositions[`node-${i}`]);
        } else {
            do {
                x = Math.random() * (gallery.clientWidth - nodeSize);
                y = Math.random() * (gallery.clientHeight - nodeSize);
            } while (isOverlapping(x, y));

            savedPositions[`node-${i}`] = { x, y };
        }

        const node = document.createElement("div");
        node.className = "node";
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.id = `node-${i}`;
        node.innerHTML = `<img src="${images[i]}">`;

        node.onmouseenter = () => node.style.borderColor = "#008CFF";
        node.onmouseleave = () => node.style.borderColor = "white";

        gallery.appendChild(node);
        nodes.push({ element: node, x, y });
    }

    localStorage.setItem('fixedNodePositions', JSON.stringify(savedPositions));

    // Connections
    function connectNodes() {
        nodes.forEach(node => {
            const neighbors = nodes
                .filter(n => n !== node)
                .map(n => ({node: n, dist: Math.hypot(node.x - n.x, node.y - n.y)}))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 2);

            neighbors.forEach(n => {
                const line = document.createElement("div");
                line.className = "line";
                gallery.insertBefore(line, gallery.firstChild);
                updateLine(line, node, n.node);
            });
        });
    }

    function updateLine(line, nodeA, nodeB) {
        const x1 = nodeA.x + nodeSize/2, y1 = nodeA.y + nodeSize/2;
        const x2 = nodeB.x + nodeSize / 2, y2 = nodeB.y + nodeSize/2;
        const dx = x2 - x1, dy = y2 - y1;
        line.style.width = `${Math.hypot(dx, dy)}px`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
        line.style.background = "rgba(255,255,255,0.5)";
    }

    connectNodes();
});
