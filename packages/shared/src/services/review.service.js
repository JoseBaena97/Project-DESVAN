import { getApiUrl } from "../config/index.js";
import { authHeader } from "../storage/index.js";

const createReview = async (reviewData) => {
  try {
    const resp = await fetch(getApiUrl() + "review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
      body: JSON.stringify(reviewData),
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.msg || "Error creating review");
    }

    return data;
  } catch (error) {
    return null;
  }
};

const getWrittenReviewsByUser = async (userId) => {
  try {
    const resp = await fetch(getApiUrl() + `user/${userId}/written_reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.msg || "Error fetching written reviews");
    }
    return data?.data ?? data?.msg ?? [];
  } catch (error) {
    return [];
  }
};

const updateReview = async (reviewId, reviewData) => {
  try {
    const resp = await fetch(getApiUrl() + `review/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
      body: JSON.stringify(reviewData),
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.msg || "Error updating review");
    }

    return data;
  } catch (error) {
    return null;
  }
};

const deleteReview = async (reviewId) => {
  try {
    const resp = await fetch(getApiUrl() + `review/${reviewId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.msg || "Error deleting review");
    }

    return data;
  } catch (error) {
    return null;
  }
};

const getReceivedReviewsByUser = async (userId) => {
  try {
    const resp = await fetch(getApiUrl() + `user/${userId}/recieved_reviews`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(await authHeader()),
      },
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.msg || "Error fetching received reviews");
    }
    return data?.data ?? data?.msg ?? [];
  } catch (error) {
    return [];
  }
};

export default {
  createReview,
  getWrittenReviewsByUser,
  getReceivedReviewsByUser,
  updateReview,
  deleteReview,
};
