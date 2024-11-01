"use client";

import { useState } from "react";
import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import Toggle from "@leafygreen-ui/toggle";
import { SearchInput, SearchResult } from "@leafygreen-ui/search-input";
import { Label } from '@leafygreen-ui/typography';

import styles from './searchBar.module.css';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const onHandleChange = () => {
        setQuery(e.target.value)
    }
    const onSearch = async (query) => {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
    };

    const handleSearch = async (e) => {
        console.log('handleSearch')
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };


    return (
        <div className={styles.searchContainer}>
            <LeafyGreenProvider>
                <div className={styles.searchToggle}>
                    <SearchInput 
                        aria-label="Label"
                        value={query}
                        defaultValue={''}
                        onChange={(e) => onHandleChange(e)}
                        onSubmit={(e) => handleSearch(e)}
                    />

                    <Toggle
                        aria-label="Dark mode toggle"
                        className={styles.toggle}
                    />

                    <Label className={styles.toggleLabel}>Vector Search</Label>
                </div>
            </LeafyGreenProvider>
        </div>
    );
};

export default SearchBar;
