import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { User } from "lucide-react";
import { memberService } from "../service/memberService";
import type { Member } from "../types/type";
import { IMG_BASE_URL } from "../config/api";
import { CHEF_TABS, type ChefEntry, type ChefTab } from "../exam/topChefData";

interface Props {
  onClose: () => void;
}

export default function TopChefNav({ onClose }: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ChefTab>(CHEF_TABS[0]);
  const [memberCache, setMemberCache] = useState<Record<string, Member>>({});

  useEffect(() => {
    const uncached = activeTab.chefs.filter((c) => !memberCache[c.id]);
    if (uncached.length === 0) return;

    Promise.allSettled(
      uncached.map((c) => memberService.getMemberById(c.id))
    ).then((results) => {
      const entries: Record<string, Member> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          entries[uncached[i].id] = r.value.data;
        }
      });
      setMemberCache((prev) => ({ ...prev, ...entries }));
    });
  }, [activeTab]);

  const handleChefClick = (chefId: string) => {
    navigate("/topchef", { state: { chefId } });
    onClose();
  };

  return (
    <div className="flex gap-3 h-53">
      {/* 좌측: TOP CHEF 타이틀 + 탭 */}
      <div className="w-40 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-orange-500 px-4 py-2.5 shrink-0">
          <p className="text-white font-extrabold text-sm tracking-widest text-center">
            TOP CHEF
          </p>
        </div>
        <div className="py-1 overflow-y-auto">
          {CHEF_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all border-l-2 ${
                activeTab.id === tab.id
                  ? "border-l-orange-500 text-orange-500 font-semibold bg-orange-50"
                  : "border-l-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 우측: 쉐프 카드 */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 overflow-x-auto">
        <div className="flex gap-3 h-full">
          {activeTab.chefs.map((chef) => {
            const member = memberCache[chef.id];
            return (
              <NavChefCard
                key={chef.id}
                chef={chef}
                member={member}
                onClick={() => handleChefClick(chef.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface NavChefCardProps {
  chef: ChefEntry;
  member?: Member;
  onClick: () => void;
}

function NavChefCard({ chef, member, onClick }: NavChefCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-300 bg-white hover:border-orange-400 transition-all shrink-0 w-24 h-full"
    >
      <div className="w-17 h-17 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-orange-200">
        {member?.profileImg ? (
          <img
            src={`${IMG_BASE_URL}/${member.profileImg}`}
            alt={member.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-7 h-7 text-orange-300" />
        )}
      </div>
      <div className="text-center w-full">
        <p className="text-sm font-semibold text-gray-700 truncate">
          {member?.nickname ?? "···"}
        </p>
        <p className="text-[10px] text-gray-400">{chef.specialty.join(" · ")}</p>
      </div>
    </button>
  );
}
