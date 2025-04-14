# Understanding Docker Container Isolation

## 1. Introduction
A docker container is a lightweight software package that contains all the dependencies needed to run a program or piece of software. The purpose of a docker container is to provide an isolated execution environment for a program that is separate from its host. This allows the container to run on any system that supports Docker.

A docker container is an instance of a docker image. A docker image is a set of instructions that defines how to create and start a container. It specifies the base image, environment variables, volume configuration, and much more. Each image is built of layers. If a layer changes, the previous layers stay the same, while the later layers are rebuilt. This method of caching layers allows images to be built faster when applications are made. 

This report will take a deep dive into how docker containers work, specifically how isolation from the host machine is achieved.

## 2. Containers vs. Virtual Machines
Containers are often confused with virtual machines (VMs) due to the isolation that is provided by both. However, this a misconception. Virtual machines have their own operating system that is separate from that of the host. This allows for true isolation from the host system, but comes at a cost of more resources (memory, CPU, etc.). By contrast, containers share the host OS and achieves the illusion of isolution through use of many Linux features.

I will review the following 3 Linux features used by Docker:
- Namespaces
- Control Groups
- Seccomp

Others are used, but these 3 are the biggest. 

## 3. Linux Namespaces
Linux namespaces partition resources acrosses processes in order to restrict resource access for processes. There are different kinds of namespaces in Linux. For example, the PID namespace allows containers to have their own process IDs in the container that are separate from the host. The mount namespace allows a container to have an independent view of the filesystem and ensures that processes outside the container cannot view the mount in the container. This allows a container to have its own filesystem that is actually mounted onto that of the host. Containers have their own InterProcess Communication (IPC) namespace that allows for processes within the container to be visible to each other, but processes outside the container do not have access to processes within the container and vice versa. 

Other namespaces are used in containers, such as the UTS namepsace and the user namespace.

## 4. Control Groups
Linux control groups (cgroups) is another method of partitioning resources across processes. Control groups can be used to restrict processes in the group to not exceed resource limits such as CPU and memory usage, number of files open, I/O bandwidth, and more. 

Processes in a docker container run in their own cgroup. Docker allows the user to specify many of these limits and configures the cgroup to match these limits. For example, the following command restricts a container to use at most one and a half of the host CPUs and at most 512 megabytes of memory. 

```
docker run hello-world --cpus=1.5 --memory=512m
```

It's important to understand that Docker does not set defaults for a container's usage limits. If the user doesn't specify this, the container will use as much as the host allows. This could lead to a container hogging resources and starving other important processes. In addition, if all memory is utilized, the Linux kernel will begin killing processes at random to free up memory. 


## 5. Seccomp
Seccomp (short for secure computing) is a Linux feature that restricts the system functions available to processes. Linux has a vast array of system calls available, and processes can do a lot of damage to the host if allowed to execute any of these. Seccomp is used to prevent this. Docker applies sensible seccomp defaults to containers that block certain system calls that could be dangerious. It does this through the use of seccomp profiles that act as whitelists for the system calls that are available. If a function is not listed, it is denied. The user can specify their own seccomp profile if desired. 

```
docker run hello-world --security-opt=/path/to/seccomp/profile.json
```

For example, the `reboot` system call is denied to containers by default. If it wasn't, the container would be able to restart the host system. This would be problematic, especially in cloud environments where the host machines aren't owned by the user.

## 6. The Docker Daemon
The docker daemon is a long-running process on the host that is the core process for managing docker containers. It manages images, containers, storage volumes, networks, and more. This process is responsible for applying the isolation features discussed above, such as the default seccomp profile. Because of this, the daemon needs to be running in a Linux environment to take advantage of these features. So how does docker run on other operating systems such as Windows and MacOS?

Docker Desktop is an desktop application that provides the docker daemon to Windows and MacOS. In Windows, Microsoft has built isolation features similar to the Linux ones discussed above that Docker Desktop uses when providing the daemon. In addition, the Windows Subsystem for Linux (WSL) can be used to provide a true Linux environment on a Windows host. Docker Desktop can connect to WSL and run the daemon there. In MacOS, Docker Desktop uses a hypervisor framework for MacOS devices that allows for a lightweight VM to be run. Docker manages this VM for the user, and runs the daemon in this VM. This allows for the core features of isolation to be available for containers on Windows and MacOS. 

## 7. Conclusion
Docker containers provide powerful, isolated environments while maintaining efficiency compared to traditional solutions such as VMs. Through the use of Linux kernel features, including namespaces for resource partitioning, control groups for resource limits, and seccomp for system call availability, Docker creates secure, isolated environments without the overhead of an entire separate OS.
This approach allows applications to be packaged with all their dependencies, ensuring consistency across different environments while maintaining isolation. The Docker daemon serves as the orchestrator of these isolation features, managing the complete container lifecycle regardless of the host operating system.

Docker containers are extremely important for DevOps. They allow for applications to be packaged up and deployed to multiple environments DevOps engineers can mange the security and resource utilization of the containers running their application, ensuring that end users have a good experience. Cloud platforms such as AWS provide managed environments for containers that allow for DevOps engineers to have further control of their application. 