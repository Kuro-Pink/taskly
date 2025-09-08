import { Droppable, Draggable } from '@hello-pangea/dnd';
import CreateIssueBox from './CreateIssueBox';

const SprintList = ({
    sprints,
    issues,
    currentProject,
    keyPrefix,
    handleEditSprint,
    handleDeleteSprint,
    handleEditIssue,
    handleDeleteIssue,
    handleSaveEdit,
    handleCancelEditIssue,
    editingIssueId,
    editedTitle,
    setEditedTitle,
    creatingAt,
    setCreatingAt,
    handleAddIssue,
    menuOpen,
    setMenuOpen,
}) => {
    return (
        <>
            {sprints
                .filter(
                    (sprint) =>
                        String(sprint.project) === String(currentProject._id) && String(sprint.started) === 'false',
                )
                .map((sprint) => (
                    <div key={sprint._id} className="rounded-md bg-gray-200 p-4">
                        <div className="flex items-center justify-between border-b p-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold">
                                    {`${currentProject.key || keyPrefix} ${sprint.name}`}
                                </h2>
                                <span className="text-sm text-gray-500">
                                    {new Date(sprint.startDate).toLocaleDateString()} -{' '}
                                    {new Date(sprint.endDate).toLocaleDateString()}
                                </span>
                                <span className="rounded-md bg-blue-200 px-2 py-1 text-sm">
                                    {issues.filter((issue) => String(issue.sprint) === String(sprint._id)).length}{' '}
                                    issues
                                </span>
                            </div>

                            {/* Button actions */}
                            <div className="relative flex gap-2">
                                <button
                                    className="rounded-md bg-blue-500 px-3 py-1 text-white"
                                    onClick={() => {
                                        handleEditSprint(sprint, 'start');
                                        setMenuOpen(null);
                                    }}
                                >
                                    Start sprint
                                </button>
                                <button
                                    className="rounded-md bg-gray-300 px-3 py-1"
                                    onClick={() => setMenuOpen(menuOpen === sprint._id ? null : sprint._id)}
                                >
                                    ...
                                </button>

                                {menuOpen === sprint._id && (
                                    <ul className="absolute right-0 mt-12 w-56 rounded-md bg-white shadow-lg">
                                        <li
                                            className="cursor-pointer p-2 hover:bg-gray-100"
                                            onClick={() => {
                                                handleEditSprint(sprint);
                                                setMenuOpen(null);
                                            }}
                                        >
                                            Edit Sprint
                                        </li>
                                        <li
                                            className="cursor-pointer p-2 text-red-500 hover:bg-gray-100"
                                            onClick={() => {
                                                handleDeleteSprint(sprint._id);
                                                setMenuOpen(null);
                                            }}
                                        >
                                            Delete Sprint
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>

                        <Droppable droppableId={sprint._id}>
                            {(provided) => (
                                <ul ref={provided.innerRef} {...provided.droppableProps}>
                                    {issues
                                        .filter(
                                            (item) =>
                                                item.sprint &&
                                                String(item.sprint) === String(sprint._id) &&
                                                String(item.project) === String(currentProject._id),
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
                            contextId={sprint._id}
                            creatingAt={creatingAt}
                            setCreatingAt={setCreatingAt}
                            onAdd={handleAddIssue}
                        />
                    </div>
                ))}
        </>
    );
};

export default SprintList;
