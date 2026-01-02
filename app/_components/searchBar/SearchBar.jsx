"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { SearchInput } from "@leafygreen-ui/search-input";

import styles from "./searchBar.module.css";
import { setQuery } from "@/redux/slices/ProductsSlice";

const SearchBar = () => {
  const dispatch = useDispatch();
  const [localQuery, setLocalQuery] = useState(
    useSelector((state) => state.Products.query)
  );

  const onSearchSubmit = () => {
    dispatch(setQuery(localQuery));
  };

  return (
    <div className={`${styles.searchContainer}`}>
      <div className={styles.searchInputContainer}>
        <SearchInput
          className={styles.searchInput}
          aria-label="Label"
          onChange={(e) => setLocalQuery(e.target.value)} // Update state on change
          onSubmit={() => onSearchSubmit()}
          value={localQuery} // Use 'value' to make it a controlled component
          defaultValue={localQuery}
        />
      </div>
    </div>
  );
};

export default SearchBar;
