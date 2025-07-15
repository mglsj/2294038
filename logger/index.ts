type LogProps = {
    stack: "backend" | "frontend";
    level: "debug" | "info" | "warn" | "error" | "fatal";
    package: "cache" | "controller" | "cron_job" | "db" | "handler" | "repository" | "route" | "service" | "auth" | "config" | "middleware" | "utils";
    message: string;
};

export default async function Log(props: LogProps, token: string) {
    const api = "http://20.244.56.144/evaluation-service/logs";

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(api, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(props),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Log sent successfully:", data);
        })
        .catch((error) => {
            console.error("Error sending log:", error);
        });
}