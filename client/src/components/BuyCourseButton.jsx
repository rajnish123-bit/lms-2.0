import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLoadUserQuery } from "@/features/api/authApi"; // Import for refetching user data

const BuyCourseButton = ({ courseId }) => {
  const [createCheckoutSession, { data, isLoading, isSuccess, isError, error }] =
    useCreateCheckoutSessionMutation();

  const { refetch: refetchUser } = useLoadUserQuery(undefined, { skip: true }); // Setup refetch for user data

  const purchaseCourseHandler = async () => {
    try {
      await createCheckoutSession(courseId);
    } catch (err) {
      toast.error("Unexpected error occurred while creating checkout session.");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      if (data?.url) {
        toast.success("Redirecting to payment gateway...");
        window.location.href = data.url; // Redirect to Stripe checkout URL
      } else {
        toast.error("Invalid response from server. Please try again.");
      }
    }

    if (isError) {
      toast.error(error?.data?.message || "Failed to create checkout session.");
    }
  }, [data, isSuccess, isError, error]);

  useEffect(() => {
    // Refetch user data after payment is successful
    if (isSuccess && data?.url === undefined) {
      refetchUser();
      toast.success("Course added to My Learning!");
    }
  }, [isSuccess, data, refetchUser]);

  return (
    <Button
      disabled={isLoading}
      onClick={purchaseCourseHandler}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;
