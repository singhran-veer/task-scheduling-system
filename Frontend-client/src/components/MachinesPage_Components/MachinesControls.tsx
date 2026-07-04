import AnimatedButton from "../../common/Animations/AnimatedButton/AnimatedButton";

interface MachinesControlsProps {
    onAddMachine: () => void;
    onExportCsv?: () => void;
    canManage: boolean;
}

const MachinesControls = ({ onAddMachine, canManage }: MachinesControlsProps) => {
    if (!canManage) return null;

    return (
        <div className="machines-header-actions">
            <AnimatedButton onClick={onAddMachine}>
                <i className="fa-solid fa-plus mr-2"></i>
                Add Machine
            </AnimatedButton>
        </div>
    );
};

export default MachinesControls;
