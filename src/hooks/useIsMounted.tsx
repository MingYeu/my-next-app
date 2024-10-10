import { useEffect, useState } from "react";

const UseIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 250);
  }, []);
  return isMounted;
};

export default UseIsMounted;
