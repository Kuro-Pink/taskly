import { Droppable, Draggable } from '@hello-pangea/dnd';
import CreateIssueBox from './CreateIssueBox';

const BacklogSection = ({
    issues,
    currentProject,
    keyPrefix,
    editingIssueId,
    editedTitle,
    setEditedTitle,
    handleEditIssue,
    handleSaveEdit,
    handleCancelEditIssue,
    handleDeleteIssue,
    creatingAt,
    setCreatingAt,
    handleAddIssue,
    handleCreateSprint,
}) => {
    return (
        <div className="w-full rounded-md bg-gray-200 p-4">
            <h2 className="text-lg font-bold">Backlog</h2>
            <Droppable droppableId="backlog">
                {(provided) => (
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                        {issues
                            .filter(
                                (item) =>
                                    !item.sprint && String(item.project) === String(currentProject._id) && !item.status,
                            )
                            .map((item, index) => (
                                <Draggable key={item._id} draggableId={item._id} index={index}>
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="my-2 flex items-center justify-between rounded-md bg-white p-2 shadow"
                                        >
                                            {editingIssueId === item._id ? (
                                                <div className="flex w-full items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editedTitle}
                                                        onChange={(e) => setEditedTitle(e.target.value)}
                                                        className="flex-1 rounded border border-gray-300 px-2 py-1"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleSaveEdit(item._id)}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        ✔️
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEditIssue}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-2 py-1 text-sm font-bold ${
                                                                item.type === 'Task'
                                                                    ? 'text-green-500'
                                                                    : item.type === 'Bug'
                                                                      ? 'text-red-500'
                                                                      : 'text-blue-500'
                                                            }`}
                                                        >
                                                            {item.type}
                                                        </span>
                                                        <p>{`${currentProject.key || keyPrefix} - ${item.number} ${item.title}`}</p>
                                                        <button
                                                            onClick={() => handleEditIssue(item)}
                                                            className="text-gray-500 hover:text-blue-500"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteIssue(item._id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        🗑️
                                                    </button>
                                                </>
                                            )}
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                        {provided.placeholder}
                    </ul>
                )}
            </Droppable>

            <CreateIssueBox
                contextId="backlog"
                creatingAt={creatingAt}
                setCreatingAt={setCreatingAt}
                onAdd={handleAddIssue}
            />
            <button onClick={handleCreateSprint} className="mt-4 rounded-md bg-blue-500 p-2 text-white">
                + Create Sprint
            </button>
        </div>
    );
};

export default BacklogSection;
