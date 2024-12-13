import { useState, useMemo } from "react";

const Avatar = ({ assignee }) => {
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
  };

  const initials = useMemo(() => {
    const name = assignee?.displayName || "";
    const nameParts = name.split(" ");
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase();
    const secondInitial = nameParts[1]?.charAt(0).toUpperCase();
    return secondInitial ? `${firstInitial}${secondInitial}` : firstInitial;
  }, [assignee?.displayName]);

  return (
    <>
      {assignee && assignee.avatarUrls?.["24x24"] && !imgError ? (
        <img
          src={assignee.avatarUrls["24x24"]}
          alt="A"
          className="w-6 h-6 rounded-full mr-2"
          onError={handleImageError}
        />
      ) : (
        <div className="w-6 h-6 flex items-center text-xs font-bold justify-center bg-blue-500 text-white rounded-full mr-2">
          {initials}
        </div>
      )}
    </>
  );
};

export default Avatar;
