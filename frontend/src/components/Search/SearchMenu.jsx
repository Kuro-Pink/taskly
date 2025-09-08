// SearchMenu.jsx
export default function SearchMenu({ results = [], onClose, onSelect }) {
    const grouped = ['Issue', 'Epic', 'Member'].map((type) => ({
        type,
        items: results.filter((r) => r.type === type),
    }));

    return (
        <div className="max-h-[300px] w-[520px] overflow-y-auto rounded-md bg-white shadow-lg">
            {grouped.map((group) =>
                group.items.length > 0 ? (
                    <div key={group.type} className="mb-2">
                        <div className="px-3 py-1 text-sm font-bold text-gray-700 uppercase">{group.type}s</div>
                        {group.items.map((item) => (
                            <div
                                key={item.id}
                                className="cursor-pointer px-3 py-2 text-xl hover:bg-gray-100"
                                onClick={() => {
                                    onSelect(item); // ✅ Truyền item ra ngoài
                                    if (onClose) onClose();
                                }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                ) : null,
            )}
        </div>
    );
}
