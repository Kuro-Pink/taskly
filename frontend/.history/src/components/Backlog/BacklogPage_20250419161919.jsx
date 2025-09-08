import { DragDropContext } from '@hello-pangea/dnd';
import SprintList from './SprintList';
import BacklogSection from './BacklogSection';

const BacklogPage = (props) => {
    return (
        <DragDropContext onDragEnd={props.onDragEnd}>
            <div className="flex flex-col gap-4 p-4">
                <SprintList {...props} />
                <div className="flex items-start gap-4">
                    <BacklogSection {...props} />
                </div>
            </div>
        </DragDropContext>
    );
};

export default BacklogPage;
