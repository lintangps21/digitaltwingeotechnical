import { useRef, useState } from "react";

function useScrollableList(cardHeight = 160) {
  const containerRef = useRef(null);
  const [atEnd, setAtEnd] = useState(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // check if we reached bottom
    setAtEnd(scrollTop + clientHeight >= scrollHeight - 5);
  };

  const handleArrowClick = () => {
    if (!containerRef.current) return;

    if (atEnd) {
      // go back to top
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      setAtEnd(false);
    } else {
      // scroll down by N px (e.g., 2 cards)
      containerRef.current.scrollBy({ top: cardHeight, behavior: "smooth" });
    }
  };

  return { containerRef, atEnd, handleScroll, handleArrowClick };
}

export default useScrollableList;
