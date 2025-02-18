import React from 'react';

function CategoryList({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="categories">
      <button
        onClick={() => onSelectCategory('All')}
        className={selectedCategory === 'All' ? 'active' : ''}
      >
        All
      </button>
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={selectedCategory === category ? 'active' : ''}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryList;
