const NumberInputs = ({ idx, set, handleNumberInputs }) => {
    return (
        <div className="flex flex-row gap-3 flex-wrap">
            <div className="flex flex-col min-w-[20px] flex-1">
                <label className="block text-sm mb-1">Sarjat <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    min="0"
                    value={set.sets}
                    onChange={e => handleNumberInputs(idx, "sets", e.target.value)}
                    className="border border-stone-700 bg-black text-gray-100 px-2 py-1 w-full text-center rounded"
                    required
                />
            </div>
            <div className="flex flex-col min-w-[20px] flex-1">
                <label className="block text-sm mb-1">Toistot <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    value={set.reps}
                    onChange={e => handleNumberInputs(idx, "reps", e.target.value)}
                    className="border border-stone-700 bg-black text-gray-100 px-2 py-1 w-full text-center rounded"
                    placeholder="8 tai 8,7"
                    required
                />
            </div>
            <div className="flex flex-col min-w-[20px] flex-1">
                <label className="block text-sm mb-1">Paino(kg)</label>
                <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={set.weight}
                    onChange={e => handleNumberInputs(idx, "weight", e.target.value)}
                    className="border border-stone-700 bg-black text-gray-100 px-2 py-1 w-full text-center rounded"
                />
            </div>
        </div>
    );
};

export default NumberInputs;
