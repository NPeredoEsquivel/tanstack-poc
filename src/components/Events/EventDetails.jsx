import { Link, Outlet } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, deleteEvent, queryClient } from "../../utils/http.js";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import Header from "../Header.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  const { data, isError, error, isPending } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const handleStartDelete = () => {
    setIsDeleting(true);
  };

  const handleStopDelete = () => {
    setIsDeleting(false);
  };

  const {
    mutate,
    isPending: isMutationPending,
    isError: mutationHasError,
    error: mutationError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      }),
        navigate("/events");
    },
  });

  const handleDeleteEvent = () => {
    mutate({ id: params.id });
  };

  let detailContent;

  if (isPending) {
    detailContent = (
      <div id="event-details-content" className="center">
        <p>Loading event...</p>
      </div>
    );
  }

  if (isError) {
    detailContent = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Error fetching the event selected"
          message={error.info?.message || "Error, try again later."}
        />
      </div>
    );
  }

  if (data) {
    const date = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    detailContent = (
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:4000/${data.image}`} alt={data.image} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    );
  }

  let deleteContent = (
    <>
      <h2>Are you sure?</h2>
      <p>
        Do you really want to delete this event ? This action cannot be undone.
      </p>
      <div className="form-actions">
        <button className="button-text" onClick={handleStopDelete}>
          Cancel
        </button>
        <button className="button" onClick={handleDeleteEvent}>
          Delete
        </button>
      </div>
    </>
  );

  if (isMutationPending) {
    deleteContent = <p>Deleting Event...</p>;
  }

  if (mutationHasError) {
    deleteContent = (
      <ErrorBlock
        title="Error deleting the event selected"
        message={mutationError.info?.message || "Error, try again later."}
      />
    );
  }
  return (
    <>
      {isDeleting && <Modal onClose={handleStopDelete}>{deleteContent}</Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {detailContent}
    </>
  );
}
