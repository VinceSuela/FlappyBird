export default function PipeUp({ image, x, height }) {
  return (
    <div
      className="pipe-up"
      style={{
        left: `${x}px`,
        top: 0,
        height: `${height}px`,
        backgroundImage: `url(${image})`,
      }}
    />
  );
}
