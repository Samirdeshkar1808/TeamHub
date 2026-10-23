
import SummaryCard from "./SummaryCard";
import { summaryCards } from "../../config/dashboardConfig";

export default function SummaryCards({ summary, navigate }) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((item) => (
        <SummaryCard
          key={item.key}
          item={item}
          summary={summary}
          navigate={navigate}
        />
      ))}
    </section>
  );
}
