import React from "react";
import { useLoadUserQuery } from "@/features/api/authApi";

const MyLearning = () => {
  const { data, isLoading } = useLoadUserQuery();
  const myLearning = data?.user?.enrolledCourses || [];

  return (
    <div className="max-w-4xl mx-auto my-10 px-4">
      <h1 className="font-bold text-2xl">MY LEARNING</h1>
      <div className="my-5">
        {isLoading ? (
          <p>Loading...</p>
        ) : myLearning.length === 0 ? (
          <p>You are not enrolled in any courses.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myLearning.map((course, index) => (
              <div key={index} className="bg-green-100 p-4 rounded-lg">
                <h2 className="text-xl font-bold">{course.courseTitle}</h2>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;
