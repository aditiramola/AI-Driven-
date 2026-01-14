export default function AssetRow({ asset }) {
  const color =
    asset.risk_level === "High"
      ? "#ef4444"
      : asset.risk_level === "Medium"
      ? "#f59e0b"
      : "#22c55e";

  return (
    <tr>
      <td>{asset.symbol}</td>
      <td>{asset.current_price}</td>
      <td>{asset.predicted_price}</td>
      <td>{asset.trend}</td>
      <td style={{ color, fontWeight: 600 }}>
        {asset.risk_level}
      </td>
    </tr>
  );
}
