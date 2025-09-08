const CreateIssueBox = ({ contextId, creatingAt, setCreatingAt, onAdd }) => {
    const [issue, setIssue] = useState({ title: '', type: 'Task' });
    const isCreating = creatingAt === contextId;

    const handleAdd = () => {
        if (!issue.title.trim()) return;
        onAdd(issue, contextId === 'backlog' ? null : contextId);
        setIssue({ title: '', type: 'Task' });
        setCreatingAt(null);
    };

    return isCreating ? (
        <div className="my-2 rounded-md bg-white p-2 shadow">
            <input
                type="text"
                value={issue.title}
                onChange={(e) => setIssue({ ...issue, title: e.target.value })}
                className="w-full rounded-md border p-1"
                placeholder="Issue title"
            />
            <select
                value={issue.type}
                onChange={(e) => setIssue({ ...issue, type: e.target.value })}
                className="mt-2 w-full rounded-md border p-1"
            >
                <option value="Task">Task</option>
                <option value="Bug">Bug</option>
                <option value="Story">Story</option>
            </select>
            <button onClick={handleAdd} className="mt-2 w-full rounded-md bg-blue-500 p-1 text-white">
                Add Issue
            </button>
            <button onClick={() => setCreatingAt(null)} className="mt-2 w-full rounded-md bg-gray-300 p-1">
                Cancel
            </button>
        </div>
    ) : (
        <button onClick={() => setCreatingAt(contextId)} className="mt-2 w-full rounded-md bg-gray-300 p-2">
            + Create Issue
        </button>
    );
};

export default CreateIssueBox;
