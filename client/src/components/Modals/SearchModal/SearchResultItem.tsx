import React, { useEffect, useState } from "react";
import "./SearchResultItem.scss";
import Link from "next/link";
export interface ISearchResultItemProps {
  type: string;
  title: string;
  key: number;
  nodeId: string;
  date: string;
  onClose: () => void;
}
export const SearchResultItem = (props: ISearchResultItemProps) => {
  const { key, type, title, nodeId, onClose, date } = props;

  const [formattedDate, setFormattedDate] = useState<string>("");

  const processDate = () => {
    const d = new Date(date);
    const month = d.toLocaleString("default", { month: "short" }); // "Nov"
    const day = d.getDate();
    const year = d.getFullYear();

    let result = "";
    if (year === 2023) {
      result = `${month} ${day}`;
    } else {
      result = `${month} ${day}, ${year}`;
    }

    setFormattedDate(result);
  };

  useEffect(() => {
    processDate();
  }, [date]);

  return (
    <Link href={`/${nodeId}`} onClick={onClose}>
      <li className="result-item">
        <div className="result-content">
          <div className="result-type">{`${type} node`}</div>
          <div className="result-title">{title}</div>
        </div>
        <div className="date-container">
          <p>{formattedDate}</p>
        </div>
      </li>
    </Link>
  );
};
