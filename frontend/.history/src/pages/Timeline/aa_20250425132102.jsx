<DragDropContext onDragEnd={handleDragEnd}>
    <div className="border-r bg-gray-50">
        <div className="border-b bg-white p-2 font-semibold">Sprint</div>
        {epics
            .filter((epic) => epic.projectId === currentProject._id)
            ?.map((epic) => (
                <Droppable key={epic._id} droppableId={epic._id}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="border-b bg-white">
                            {/* Epic Header */}
                            <div
                                className="flex cursor-pointer items-center justify-between px-2 py-1 hover:bg-gray-100"
                                onClick={() => toggleEpic(epic._id)}
                            >
                                {/* ... Giữ nguyên phần toggle Epic, sửa tên, xóa Epic, thêm Issue như bạn đã có ... */}
                            </div>

                            {/* Nếu đang thêm issue mới */}
                            {epic && addingIssueEpicId === epic._id && (
                                <div className="mt-2 mr-4 ml-6 flex items-center gap-2 rounded-md bg-white p-2 shadow">
                                    {/* ... Giữ nguyên phần input thêm Issue như cũ ... */}
                                </div>
                            )}

                            {/* List các Issue trong Epic */}
                            {expandedEpicIds.includes(epic._id) && (
                                <div className="pb-2 pl-6">
                                    {issues
                                        .filter((issue) => String(issue.epic) === String(epic._id))
                                        .map((issue, index) => {
                                            const getTypeColor = (type) => {
                                                switch (type) {
                                                    case 'Task':
                                                        return 'text-green-500';
                                                    case 'Bug':
                                                        return 'text-red-500';
                                                    case 'Story':
                                                        return 'text-blue-500';
                                                    default:
                                                        return 'text-gray-500';
                                                }
                                            };
                                            const statusObj = statuses.find(
                                                (s) => String(s._id) === String(issue.status),
                                            );

                                            return (
                                                <Draggable key={issue._id} draggableId={issue._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`flex items-center justify-between border-b px-2 py-1 text-xl ${
                                                                snapshot.isDragging ? 'bg-gray-100' : ''
                                                            }`}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span
                                                                    className={`font-bold ${getTypeColor(issue.type)}`}
                                                                >
                                                                    {issue.type}
                                                                </span>
                                                                <p>{`${currentProject.key || key} - ${issue.title}`}</p>
                                                            </div>
                                                            <div
                                                                className={`rounded px-2 py-0.5 text-sm text-white ${
                                                                    statusObj?.name === 'Phải làm'
                                                                        ? 'bg-gray-500'
                                                                        : statusObj?.name === 'Đang làm'
                                                                          ? 'bg-blue-400'
                                                                          : statusObj?.name === 'Hoàn thành'
                                                                            ? 'bg-green-400'
                                                                            : 'bg-gray-400 text-gray-700'
                                                                }`}
                                                            >
                                                                {statusObj?.name || 'No Status'}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            ))}

        {/* Phần tạo Epic mới (không cần sửa) */}
        <div className="mt-4 px-2">{/* ... Phần tạo Epic mới như bạn đã code ... */}</div>
    </div>
</DragDropContext>;
