type CurrencyProps = {
  amount: number;
  className?: string;
};

export default function Currency({ amount, className }: CurrencyProps) {
  return (
    <span className={className}>
      ${" "}
      {amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}
