"use client";

import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { SearchInput } from "@leafygreen-ui/search-input";
import Toggle from "@leafygreen-ui/toggle";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";
import { Body } from "@leafygreen-ui/typography";

import styles from "./searchBar.module.css";
import { triggerSearch, setCurrentPage, setSearchTypeValue } from "@/redux/slices/ProductsSlice";

const SearchBar = () => {
  const dispatch = useDispatch();
  const searchType = useSelector((state) => state.Products.searchType);
  const [localQuery, setLocalQuery] = useState(
    useSelector((state) => state.Products.query)
  );

  const onSearchSubmit = () => {
    dispatch(triggerSearch(localQuery));
    dispatch(setCurrentPage(1));
  };

  const onToggleSearchType = (checked) => {
    const newType = checked ? "text" : "vector";
    dispatch(setSearchTypeValue(newType));
    // Re-trigger search if there's a query
    if (localQuery) {
      dispatch(triggerSearch(localQuery));
      dispatch(setCurrentPage(1));
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputContainer}>
        <SearchInput
          className={styles.searchInput}
          aria-label="Search products"
          onChange={(e) => setLocalQuery(e.target.value)}
          onSubmit={() => onSearchSubmit()}
          value={localQuery}
        />
        <IconButton
          aria-label="Submit search"
          onClick={onSearchSubmit}
          className={styles.searchButton}
        >
          <Icon glyph="MagnifyingGlass" />
        </IconButton>
      </div>
      <div className={styles.searchTypeToggle}>
        <Body className={`${styles.toggleLabel} ${searchType === "vector" ? styles.activeLabel : ""}`}>
          Semantic
        </Body>
        <Toggle
          aria-label="Toggle search type"
          size="small"
          checked={searchType === "text"}
          onChange={onToggleSearchType}
        />
        <Body className={`${styles.toggleLabel} ${searchType === "text" ? styles.activeLabel : ""}`}>
          Keyword
        </Body>
      </div>
    </div>
  );
};

export default SearchBar;
