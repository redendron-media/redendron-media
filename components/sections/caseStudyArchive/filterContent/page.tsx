interface FiltersProps {
  industries: string[];
  selectedIndustries: string[];
  setSelectedIndustries: (val: string[]) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
}

const FiltersContent: React.FC<FiltersProps> = ({
  industries,
  selectedIndustries,
  setSelectedIndustries,
  categories,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h5 className="hidden lg:block">FILTERS</h5>
        <hr className="bg-black h-0.5" />
        <div className=" flex flex-col gap-5">
          <div>
            <div className="flex justify-between py-5 items-center mb-2">
              <p className="font-semibold">Industry</p>
              <button onClick={() => setSelectedIndustries([])}>
                <p> Clear</p>
              </button>
            </div>
            {industries.map((industry) => (
              <label
                key={industry}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIndustries.includes(industry)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIndustries([...selectedIndustries, industry]);
                    } else {
                      setSelectedIndustries(
                        selectedIndustries.filter((i) => i !== industry)
                      );
                    }
                  }}
                />
                <span>{industry}</span>
              </label>
            ))}
          </div>
          <hr className="bg-black h-0.5" />
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">Project Type</p>
              <button onClick={() => setSelectedCategory("All")}>
                <p>Clear</p>
              </button>
            </div>
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 mb-1 cursor-pointer"
              >
                <input
                  type="radio"
                   name="projectType"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={() => setSelectedCategory(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-start mt-4">
        <button
          onClick={() => {
            setSelectedIndustries([]);
            setSelectedCategory("All");
          }}
          className="text-brand-red"
        >
          <p>Clear all</p>
        </button>
      </div>
    </>
  );
};

export default FiltersContent;
