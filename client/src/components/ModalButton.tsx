import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { MotionButton } from "./animations/MotionizedButton";
import ConsultationModal from "./modals/ConsultationModal";

const ModalButton = ({
  className,
  text,
  showArrow = true,
}: {
  className?: string;
  text: string;
  showArrow?: boolean;
}) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <MotionButton
        size="lg"
        className={`bg-white text-primary hover:bg-gray-100 px-8 py-5 text-base ${className}`}
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {text}
        {showArrow && <ArrowRight className="ml-2 h-5 w-5" />}
      </MotionButton>
      <ConsultationModal showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
};

export default ModalButton;
