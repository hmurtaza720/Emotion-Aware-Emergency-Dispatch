
import { Call } from "@/data/types"; // We will create types.ts next

export const MESSAGES: Record<string, Call> = {
    "live_session_1": {
        id: "live_session_1",
        title: "Active Emergency",
        location_name: "Los Angeles, CA",
        location_coords: { lat: 34.0522, lng: -118.2437 },
        time: "2023-10-27T10:30:00Z", // Standard ISO time
        type: "Emergency Call",
        severity: "CRITICAL",
        summary: "Live caller reporting a medical emergency nearby.",
        emotions: [
            { emotion: "Panic", intensity: 0.9 },
            { emotion: "Fear", intensity: 0.8 }
        ],
        transcript: [
            { role: "assistant", content: "911 Dispatch, what is your emergency?" },
            { role: "user", content: "I think my neighbor is having a heart attack! He collapsed on the lawn." },
            { role: "assistant", content: "Okay, stay calm. I'm sending paramedics now. Is he breathing?" }
        ],
        name: "Sarah Connors",
        phone: "555-0199",
        recommendation: "Dispatch Ambulance immediately.",
        street_view: "",
        status: "Connected",
        agent_name: "AI Dispatcher",
        responder_type: "AI"
    },
    "1234": {
        id: "1234",
        title: "Power Outage Report",
        location_name: "Springfield, IL",
        location_coords: { lat: 39.7817, lng: -89.6501 },
        time: "2023-10-27T09:15:00Z",
        type: "Utility Emergency",
        severity: "MODERATE",
        summary: "Power outage reported in Springfield area.",
        emotions: [
            { emotion: "Concern", intensity: 0.6 }
        ],
        transcript: [
            { role: "user", content: "Hello, the power just went out on our whole block." },
            { role: "assistant", content: "We are aware of the outage. Crews have been dispatched." }
        ],
        name: "John Doe",
        phone: "555-1234",
        recommendation: "Notify utility company.",
        street_view: "",
        status: "Disconnected",
        agent_name: "Operator Mike",
        responder_type: "Human"
    },
    "5678": {
        id: "5678",
        title: "Traffic Accident",
        location_name: "Miami, FL",
        location_coords: { lat: 25.7617, lng: -80.1918 },
        time: "2023-10-27T10:45:00Z",
        type: "Vehicle Emergency",
        severity: "CRITICAL",
        summary: "Multi-vehicle collision on I-95.",
        emotions: [
            { emotion: "Shock", intensity: 0.8 },
            { emotion: "Anxiety", intensity: 0.7 }
        ],
        transcript: [
            { role: "assistant", content: "911, state your emergency." },
            { role: "user", content: "There's been a huge crash on the highway! Cars are everywhere." },
            { role: "assistant", content: "Are there any injuries?" },
            { role: "user", content: "Yes, I see someone bleeding." }
        ],
        name: "Carlos Riviera",
        phone: "555-5678",
        recommendation: "Dispatch Police and EMS.",
        street_view: "",
        status: "Connected",
        agent_name: "AI Dispatcher",
        responder_type: "AI"
    },
    "9012": {
        id: "9012",
        title: "Suspicious Activity",
        location_name: "Seattle, WA",
        location_coords: { lat: 47.6062, lng: -122.3321 },
        time: "2023-10-27T08:00:00Z",
        type: "Disturbance Complaint",
        severity: "RESOLVED",
        summary: "Caller reported suspicious individual loitering.",
        emotions: [
            { emotion: "Suspicion", intensity: 0.5 }
        ],
        transcript: [
            { role: "user", content: "There's a guy looking into cars." },
            { role: "assistant", content: "We will send a patrol car to check it out." }
        ],
        name: "Unknown",
        phone: "555-9012",
        recommendation: "Patrol check complete.",
        street_view: "",
        status: "Disconnected",
        agent_name: "Officer Judy",
        responder_type: "Human"
    }
};
