import styles from '../NewsWidget.module.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M7.04762 12.0952C4.2599 12.0952 2 9.83534 2 7.04762C2 4.2599 4.2599 2 7.04762 2C9.83534 2 12.0952 4.2599 12.0952 7.04762C12.0952 8.09727 11.7748 9.07209 11.2265 9.87962L13.7211 12.3741C14.093 12.7461 14.093 13.3491 13.7211 13.721C13.3491 14.0929 12.7461 14.0929 12.3742 13.721L9.87966 11.2265C9.07212 11.7748 8.09729 12.0952 7.04762 12.0952ZM7.04759 10.4129C8.90607 10.4129 10.4127 8.90627 10.4127 7.04779C10.4127 5.1893 8.90607 3.68271 7.04759 3.68271C5.1891 3.68271 3.68251 5.1893 3.68251 7.04779C3.68251 8.90627 5.1891 10.4129 7.04759 10.4129Z" 
      fill="rgb(var(--pro-icon-color))"
    />
  </svg>
);

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({ value, onChange, placeholder = 'Поиск' }: SearchInputProps) => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchIcon}>
        <SearchIcon />
      </div>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

