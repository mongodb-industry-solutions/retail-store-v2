"use client";

import React from "react";
import styles from "./getItem.module.css";
import { useEffect, useState } from "react";
import axios from "axios";
import JsonTreeViewer from "@/app/_components/jsonTreeViewer/JsonTreeViewer";

const GetItem = () => {
  const [item, setItem] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get("/api/test");
        setItem(res.data.data);
        //console.log(res.data.data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    getData();
  }, []);

  return (
    <div className={styles.container}>
      <h2>Item Details</h2>
      {item ? <JsonTreeViewer data={item} /> : <p>No item found</p>}
    </div>
  );
};

export default GetItem;
