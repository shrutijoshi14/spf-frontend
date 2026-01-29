const Select = ({ options = [], value, onChange, placeholder, className = '', ...props }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`form-select ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt, index) => {
        // Handle both simple string arrays ['A', 'B'] and object arrays [{value: 'A', label: 'A'}]
        const optionValue = typeof opt === 'object' ? opt.value : opt;
        const optionLabel = typeof opt === 'object' ? opt.label : opt;
        return (
          <option key={index} value={optionValue}>
            {optionLabel}
          </option>
        );
      })}
    </select>
  );
};

export default Select;
