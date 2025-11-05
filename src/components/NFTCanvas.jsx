import { useRef, useEffect } from 'react';

const COLORS = [
  { name: "Cyan", primary: "#00ffff", secondary: "#0088ff", glow: "rgba(0,255,255,0.5)" },
  { name: "Gold", primary: "#ffd700", secondary: "#ff8800", glow: "rgba(255,215,0,0.5)" },
  { name: "Pink", primary: "#ff00ff", secondary: "#ff0088", glow: "rgba(255,0,255,0.5)" },
  { name: "Black", primary: "#1a1a1a", secondary: "#000000", glow: "rgba(128,0,255,0.5)" },
  { name: "Purple", primary: "#8800ff", secondary: "#ff00ff", glow: "rgba(136,0,255,0.5)" },
  { name: "Green", primary: "#00ff00", secondary: "#88ff00", glow: "rgba(0,255,0,0.5)" },
  { name: "Red", primary: "#ff0000", secondary: "#ff0088", glow: "rgba(255,0,0,0.5)" },
];

export default function NFTCanvas({ image, colorIdx, stats, edition, transform }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      canvas.width = 800;
      canvas.height = 1200;
      const color = COLORS[colorIdx];

      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, 800, 1200);

      ctx.strokeStyle = color.primary;
      ctx.lineWidth = 8;
      ctx.strokeRect(30, 30, 740, 1140);

      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(80, 180, 640, 480);

      if (image) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(80, 180, 640, 480);
        ctx.clip();
        const { scale, positionX, positionY } = transform;
        ctx.drawImage(image, 80 + positionX, 180 + positionY, image.width * scale, image.height * scale);
        ctx.restore();
      } else {
        ctx.fillStyle = color.primary;
        ctx.font = "bold 32px Inter, Arial";
        ctx.textAlign = "center";
        ctx.fillText("Upload Your Image", 400, 420);
      }

      ctx.fillStyle = color.primary;
      ctx.font = "bold 56px Inter, Arial";
      ctx.textAlign = "center";
      ctx.fillText(`NFT #${edition.toString().padStart(3, "0")}`, 400, 130);

      ctx.fillStyle = color.primary;
      ctx.font = "bold 36px Inter, Arial";
      ctx.fillText(color.name.toUpperCase(), 400, 768);

      const statList = [
        { label: "ATK", value: stats.attack, y: 840 },
        { label: "DEF", value: stats.defense, y: 920 },
        { label: "SPD", value: stats.speed, y: 1000 },
        { label: "MAG", value: stats.magic, y: 1080 },
      ];

      statList.forEach((s) => {
        ctx.fillStyle = "white";
        ctx.font = "bold 28px Inter, Arial";
        ctx.textAlign = "left";
        ctx.fillText(s.label, 100, s.y);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(200, s.y - 25, 500, 35);
        ctx.fillStyle = color.primary;
        ctx.fillRect(200, s.y - 25, (s.value / 100) * 500, 35);
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Inter, Arial";
        ctx.textAlign = "center";
        ctx.fillText(s.value, 700, s.y);
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => animId && cancelAnimationFrame(animId);
  }, [image, colorIdx, stats, edition, transform]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        maxWidth: 400,
        borderRadius: 24,
        boxShadow: "0 8px 32px 0 rgba(0,255,255,0.15)",
        background: "#0a3d91",
        display: "block",
      }}
    />
  );
}

export { COLORS };
