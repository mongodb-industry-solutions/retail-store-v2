"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./sideBar.module.css";

import {
  Subtitle,
  Body
} from "@leafygreen-ui/typography";
import Checkbox from "@leafygreen-ui/checkbox";

function Sidebar({ filters, onFilterChange }) {
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [facets, setFacets] = useState([]);
  const [isScriptRunning, setIsScriptRunning] = useState(false);

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const response = await axios.get("/api/getFacets");
        setFacets(response.data.facets);
      } catch (error) {
        console.error("There was a problem with your fetch operation:", error);
      }
    };

    fetchFacets();
  }, []);

  const handleBrandChange = (event) => {
    const item = event;
    let updatedSelectedBrands = selectedBrands;

    if (selectedBrands.includes(item)) {
      updatedSelectedBrands = selectedBrands.filter((g) => g !== item);
    } else {
      updatedSelectedBrands = [...selectedBrands, item];
    }
    setSelectedBrands(updatedSelectedBrands);
    onFilterChange({ ...filters, selectedBrands: updatedSelectedBrands });
  };

  const handleCategoryChange = (event) => {
    const item = event;
    let updatedSelectedCategories = selectedCategories;

    if (selectedCategories.includes(item)) {
      updatedSelectedCategories = selectedCategories.filter((g) => g !== item);
    } else {
      updatedSelectedCategories = [...selectedCategories, item];
    }
    setSelectedCategories(updatedSelectedCategories);
    onFilterChange({
      ...filters,
      selectedCategories: updatedSelectedCategories,
    });
  };

  const toggleScript = async () => {
    setIsScriptRunning(!isScriptRunning);
    try {
      if (!isScriptRunning) {
        const startResponse = await axios.get("http://localhost:8000/start");
        console.log(startResponse.data.message);
      } else {
        const stopResponse = await axios.get("http://localhost:8000/stop");
        console.log(stopResponse.data.message);
      }
    } catch (error) {
      console.error("Error toggling the script:", error);
    }
  };

  return (
    <div className={styles.filterContainer}>
      <Subtitle>Filters</Subtitle>
      <>
        <div className={styles.brand}>
          <Body className={styles.filterTitle}>Brand</Body>

          {/* Log the list of brands */}
          {/*console.log(facets?.[0]?.facet?.brand?.buckets)*/}

          <div className={styles.checkboxList}>
            {facets?.[0]?.facet?.brand?.buckets?.map((bucket) => (
              <Checkbox
                key={bucket._id}
                label={`${bucket._id} (${bucket.count})`}
                checked={selectedBrands.includes(bucket._id)}
                onChange={() => handleBrandChange(bucket._id)}
                className={styles.checkbox}
              />
            ))}
          </div>
        </div>

        <hr className={styles.hr}></hr>

        <div className={styles.brand}>
          <Body className={styles.filterTitle}>Type of Product</Body>

          <div className={styles.checkboxList}>
            {facets?.[0]?.facet?.masterCategory?.buckets?.map((bucket) => (
              <Checkbox
                key={bucket._id}
                label={`${bucket._id} (${bucket.count})`}
                checked={selectedCategories.includes(bucket._id)}
                onChange={() => handleCategoryChange(bucket._id)}
                className={styles.checkbox}
              />
            ))}
          </div>
        </div>
      </>
    </div>
  );
}

export default Sidebar;
