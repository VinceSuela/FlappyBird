export default function PipeDown({ image, x, height }) {
  return (
    <div
      className="pipe-down"
      style={{
        left: `${x}px`,
        bottom: "112px",
        height: `${height}px`,
        backgroundImage: `url(${image})`,
      }}
    />
  );
}
