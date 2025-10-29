"use client";
import { useState } from "react";
import cn from "clsx";
import Card from "@/components2/usefull/Card";
import Modal from "@/components/utils/modal";

const members = [
  {
    id: 1,
    name: "John Doe",
    userId: "#959505850",
    avatar: "👨‍💼",
    avatarBg: "bg-amber-800"
  },
  {
    id: 2,
    name: "Sarah Smith",
    userId: "#959505850",
    avatar: "👩‍💻",
    avatarBg: "bg-yellow-500"
  },
  {
    id: 3,
    name: "Ahmed Hassan",
    userId: "#959505850",
    avatar: "👳‍♂️",
    avatarBg: "bg-purple-400"
  },
  {
    id: 4,
    name: "Maria Garcia",
    userId: "#959505850",
    avatar: "👩‍🎨",
    avatarBg: "bg-sky-300"
  },
  {
    id: 5,
    name: "David Chen",
    userId: "#959505850",
    avatar: "👨‍🔬",
    avatarBg: "bg-green-500"
  },
  {
    id: 6,
    name: "Emma Wilson",
    userId: "#959505850",
    avatar: "👩‍🏫",
    avatarBg: "bg-pink-400"
  },
  {
    id: 7,
    name: "Michael Brown",
    userId: "#959505850",
    avatar: "👨‍💻",
    avatarBg: "bg-blue-500"
  },
  {
    id: 8,
    name: "Lisa Johnson",
    userId: "#959505850",
    avatar: "👩‍⚕️",
    avatarBg: "bg-red-400"
  }
];

type PodMembersProps = {
  className?: string;
};

const PodMembers = ({ className }: PodMembersProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const displayedMembers = members.slice(0, 4);

  return (
    <>
      <Card
        title="Group Members"
        tooltip="View all members in your pod"
        onSeeMore={() => setModalVisible(true)}
        className={className}
      >
        <div className="grid grid-cols-2 gap-4 mt-6">
          {displayedMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </Card>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        position={{ vertical: "center", horizontal: "center" }}
      >
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">All Group Members</h3>
            <button
              onClick={() => setModalVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};

interface MemberCardProps {
  member: {
    id: number;
    name: string;
    userId: string;
    avatar: string;
    avatarBg: string;
  };
}

const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <div className="rounded-xl px-5 py-2.5 flex flex-col items-center gap-3 border border-secondary-100">
      <div className={cn(
        "size-10 rounded-full flex items-center justify-center text-2xl",
        member.avatarBg
      )}>
        {member.avatar}
      </div>
      <div className="text-center">
        <div className="text-xs text-text-300 mb-1">User ID</div>
        <div className="text-sm font-semibold text-text-300">{member.userId}</div>
      </div>
    </div>
  );
};

export default PodMembers;
