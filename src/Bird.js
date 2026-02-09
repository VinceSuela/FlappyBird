export default function Bird({ image, rotation, birdY }) {
  return (
    <div
      className="bird"
      style={{
        transform: `translateY(${birdY}px) rotate(${rotation}deg)`,
        position: "absolute",
        left: "170px",
        top: "270px",
        width: "34px",
        height: "24px",
        zIndex: 30,
      }}
    >
      <img src={image} alt="bird" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
